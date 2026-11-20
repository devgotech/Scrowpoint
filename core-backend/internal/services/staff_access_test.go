package services

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

func TestValidateSessionRejectsRevokedSuspendedAndUnknown(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	user, err := auth.SignUp(ctx, SignUpInput{Email: "session@example.com", Password: "password-123", Name: "Session User"})
	if err != nil {
		t.Fatalf("SignUp: %v", err)
	}
	session, err := auth.CreateSession(ctx, user.ID, "test", "127.0.0.1")
	if err != nil {
		t.Fatalf("CreateSession: %v", err)
	}
	if role, err := auth.ValidateSession(ctx, user.ID, session.ID); err != nil || role != db.RoleBuyer {
		t.Fatalf("ValidateSession on a live session = %q, %v", role, err)
	}
	if _, err := auth.ValidateSession(ctx, user.ID, uuid.New()); !errors.Is(err, ErrSessionInvalid) {
		t.Fatalf("unknown session accepted: %v", err)
	}

	// Role changes take effect on the next request.
	auth.Mu.Lock()
	user.Role = db.RoleSeller
	auth.Mu.Unlock()
	if role, _ := auth.ValidateSession(ctx, user.ID, session.ID); role != db.RoleSeller {
		t.Fatalf("ValidateSession returned stale role %q", role)
	}

	if err := auth.Logout(ctx, session.ID); err != nil {
		t.Fatalf("Logout: %v", err)
	}
	if _, err := auth.ValidateSession(ctx, user.ID, session.ID); !errors.Is(err, ErrSessionInvalid) {
		t.Fatalf("revoked session accepted: %v", err)
	}

	second, _ := auth.CreateSession(ctx, user.ID, "test", "127.0.0.1")
	moderation := NewModerationService(auth, nil, nil, nil)
	if err := moderation.SuspendUser(ctx, user.ID, uuid.New(), "fraud"); err != nil {
		t.Fatalf("SuspendUser: %v", err)
	}
	if _, err := auth.ValidateSession(ctx, user.ID, second.ID); !errors.Is(err, ErrSessionInvalid) {
		t.Fatalf("suspended user's session accepted: %v", err)
	}
}

func TestStaffDeactivationRules(t *testing.T) {
	ctx := context.Background()
	auth := NewAuthService()
	admin, _ := auth.SignUp(ctx, SignUpInput{Email: "admin@example.com", Password: "password-123", Name: "Admin", Role: db.RoleAdmin})
	mediator, _ := auth.SignUp(ctx, SignUpInput{Email: "mediator@example.com", Password: "password-123", Name: "Mediator", Role: db.RoleMediator})
	buyer, _ := auth.SignUp(ctx, SignUpInput{Email: "buyer@example.com", Password: "password-123", Name: "Buyer"})
	mediatorSession, _ := auth.CreateSession(ctx, mediator.ID, "", "")

	if _, err := auth.SetStaffActive(ctx, admin.ID, admin.ID, false); err == nil {
		t.Fatal("an admin deactivated themselves")
	}
	if _, err := auth.SetStaffActive(ctx, mediator.ID, admin.ID, false); err == nil {
		t.Fatal("the last active admin was deactivated")
	}
	if _, err := auth.SetStaffActive(ctx, admin.ID, buyer.ID, false); err == nil {
		t.Fatal("a non-staff account was treated as staff")
	}
	member, err := auth.SetStaffActive(ctx, admin.ID, mediator.ID, false)
	if err != nil || member.IsActive {
		t.Fatalf("deactivate mediator = %+v, %v", member, err)
	}
	if _, err := auth.ValidateSession(ctx, mediator.ID, mediatorSession.ID); err == nil {
		t.Fatal("deactivated mediator kept a live session")
	}
	if _, _, err := auth.Login(ctx, mediator.Email, "password-123", "", ""); err == nil {
		t.Fatal("deactivated mediator could still log in")
	}
	if member, err := auth.SetStaffActive(ctx, admin.ID, mediator.ID, true); err != nil || !member.IsActive {
		t.Fatalf("reactivate mediator = %+v, %v", member, err)
	}

	staff, _ := auth.ListStaff(ctx)
	if len(staff) != 2 || staff[0].Role != db.RoleAdmin {
		t.Fatalf("ListStaff = %+v, want admin then mediator", staff)
	}

	token, _, err := auth.CreateMediatorInvitation(ctx, admin.ID, "new-mediator@example.com")
	if err != nil {
		t.Fatalf("CreateMediatorInvitation: %v", err)
	}
	if !auth.RevokeMediatorInvitation(ctx, "new-mediator@example.com") {
		t.Fatal("RevokeMediatorInvitation found nothing to revoke")
	}
	if _, err := auth.AcceptMediatorInvitation(ctx, token, "New Mediator", "long-password-123"); err == nil {
		t.Fatal("a revoked invitation was accepted")
	}
}

func TestMediatorVerdictsRequireAssignment(t *testing.T) {
	ctx := context.Background()
	fixture := newCoverageFixture(t)
	mediator, _ := fixture.auth.SignUp(ctx, SignUpInput{Email: "assigned-mediator@example.com", Password: "password-123", Name: "Assigned", Role: db.RoleMediator})
	other, _ := fixture.auth.SignUp(ctx, SignUpInput{Email: "other-mediator@example.com", Password: "password-123", Name: "Other", Role: db.RoleMediator})

	fixture.order.EscrowState = db.EscrowStateInTransit
	disputes := NewDisputeService(fixture.orders, fixture.escrow, fixture.auth)
	dispute, err := disputes.OpenDispute(ctx, fixture.buyer.ID, OpenDisputeInput{OrderID: fixture.order.ID, IssueType: "damaged item"})
	if err != nil {
		t.Fatalf("OpenDispute: %v", err)
	}
	verdict := DisputeVerdictInput{Outcome: db.MediationOutcomeSplit, Notes: "Battery misrepresented"}

	if _, err := disputes.AssignDispute(ctx, dispute.ID, fixture.buyer.ID); err == nil {
		t.Fatal("a case was assigned to a non-staff account")
	}
	if _, err := disputes.IssueMediationVerdict(ctx, dispute.ID, mediator.ID, db.RoleMediator, verdict); !errors.Is(err, ErrDisputeForbidden) {
		t.Fatalf("unassigned mediator issued a verdict: %v", err)
	}
	if list, _, _ := disputes.ListDisputesForStaff(ctx, mediator.ID, db.RoleMediator, "", 1, 10); len(list) != 0 {
		t.Fatalf("unassigned mediator can see %d cases", len(list))
	}

	if _, err := disputes.AssignDispute(ctx, dispute.ID, mediator.ID); err != nil {
		t.Fatalf("AssignDispute: %v", err)
	}
	if !disputes.CanStaffAccessDispute(dispute.ID, mediator.ID, db.RoleMediator) || disputes.CanStaffAccessDispute(dispute.ID, other.ID, db.RoleMediator) {
		t.Fatal("dispute access does not follow assignment")
	}
	if list, _, _ := disputes.ListDisputesForStaff(ctx, mediator.ID, db.RoleMediator, "", 1, 10); len(list) != 1 {
		t.Fatalf("assigned mediator sees %d cases, want 1", len(list))
	}
	if _, err := disputes.IssueMediationVerdict(ctx, dispute.ID, other.ID, db.RoleMediator, verdict); !errors.Is(err, ErrDisputeForbidden) {
		t.Fatalf("a different mediator issued a verdict: %v", err)
	}
	resolved, err := disputes.IssueMediationVerdict(ctx, dispute.ID, mediator.ID, db.RoleMediator, verdict)
	if err != nil {
		t.Fatalf("assigned mediator verdict: %v", err)
	}
	if resolved.VerdictIssuedBy == nil || *resolved.VerdictIssuedBy != mediator.ID {
		t.Fatalf("VerdictIssuedBy = %v, want %s", resolved.VerdictIssuedBy, mediator.ID)
	}
	if _, err := disputes.IssueMediationVerdict(ctx, dispute.ID, fixture.admin.ID, db.RoleAdmin, verdict); err == nil {
		t.Fatal("a second verdict was accepted on a resolved dispute")
	}

	appeal, err := disputes.SubmitAppeal(ctx, dispute.ID, fixture.seller.ID, AppealInput{Reason: "Battery was 97% at dispatch"})
	if err != nil {
		t.Fatalf("SubmitAppeal: %v", err)
	}
	if _, err := disputes.DecideAppeal(ctx, appeal.ID, mediator.ID, db.RoleMediator, true, "Upheld"); !errors.Is(err, ErrDisputeForbidden) {
		t.Fatalf("a mediator decided the appeal of their own verdict: %v", err)
	}
	if _, err := disputes.DecideAppeal(ctx, appeal.ID, fixture.admin.ID, db.RoleAdmin, true, "Upheld on review"); err != nil {
		t.Fatalf("admin DecideAppeal: %v", err)
	}
	if _, err := disputes.DecideAppeal(ctx, appeal.ID, fixture.admin.ID, db.RoleAdmin, false, "Changed mind"); err == nil {
		t.Fatal("an appeal was decided twice")
	}
}

func TestFailedSettlementRollsVerdictBack(t *testing.T) {
	ctx := context.Background()
	fixture := newCoverageFixture(t)
	fixture.order.EscrowState = db.EscrowStateInTransit
	disputes := NewDisputeService(fixture.orders, fixture.escrow, fixture.auth)
	dispute, err := disputes.OpenDispute(ctx, fixture.buyer.ID, OpenDisputeInput{OrderID: fixture.order.ID, IssueType: "damaged item"})
	if err != nil {
		t.Fatalf("OpenDispute: %v", err)
	}
	// The fixture escrow is unfunded, so a refund cannot settle.
	if _, err := disputes.IssueMediationVerdict(ctx, dispute.ID, fixture.admin.ID, db.RoleAdmin,
		DisputeVerdictInput{Outcome: db.MediationOutcomeRefundBuyer}); err == nil {
		t.Fatal("refund verdict on an unfunded escrow succeeded")
	}
	after, _ := disputes.GetDisputeByID(ctx, dispute.ID)
	if after.Status == db.DisputeStatusResolved || after.MediationOutcome != nil || after.VerdictIssuedBy != nil {
		t.Fatalf("failed settlement left the dispute resolved: %+v", after)
	}
	if _, err := disputes.IssueMediationVerdict(ctx, dispute.ID, fixture.admin.ID, db.RoleAdmin,
		DisputeVerdictInput{Outcome: db.MediationOutcomeSplit}); err != nil {
		t.Fatalf("retrying the verdict after rollback: %v", err)
	}
}

func TestStaffCannotHandleTheirOwnTrade(t *testing.T) {
	ctx := context.Background()
	fixture := newCoverageFixture(t)
	// The buyer on this order is promoted to mediator to model a staff member who also trades.
	fixture.auth.Mu.Lock()
	fixture.buyer.Role = db.RoleMediator
	fixture.auth.Mu.Unlock()

	fixture.order.EscrowState = db.EscrowStateInTransit
	disputes := NewDisputeService(fixture.orders, fixture.escrow, fixture.auth)
	dispute, err := disputes.OpenDispute(ctx, fixture.buyer.ID, OpenDisputeInput{OrderID: fixture.order.ID, IssueType: "damaged item"})
	if err != nil {
		t.Fatalf("OpenDispute: %v", err)
	}
	if _, err := disputes.AssignDispute(ctx, dispute.ID, fixture.buyer.ID); err == nil {
		t.Fatal("a case was assigned to the buyer on the order")
	}
}
