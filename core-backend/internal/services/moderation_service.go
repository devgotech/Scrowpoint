package services

import (
	"context"
	"errors"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"

	"core-backend/internal/db"
)

type CreateReportInput struct {
	TargetType db.ReportTargetType `json:"targetType"`
	TargetID   uuid.UUID           `json:"targetId"`
	Reason     string              `json:"reason"`
}

type AdminSummaryDTO struct {
	OpenDisputesCount   int     `json:"openDisputesCount"`
	PendingKYCCount     int     `json:"pendingKycCount"`
	ActiveReportsCount  int     `json:"activeReportsCount"`
	TotalEscrowHeld     float64 `json:"totalEscrowHeld"`
	ActiveOrdersCount   int     `json:"activeOrdersCount"`
	SuspendedUsersCount int     `json:"suspendedUsersCount"`
	PlatformFeeEarned   float64 `json:"platformFeeEarned"`
	Currency            string  `json:"currency"`
}

type ModerationService struct {
	mu             sync.RWMutex
	reportsByID    map[uuid.UUID]*db.Report
	authService    *AuthService
	disputeService *DisputeService
	orderService   *OrderService
	kycService     *KYCService
}

func NewModerationService(
	authService *AuthService,
	disputeService *DisputeService,
	orderService *OrderService,
	kycService *KYCService,
) *ModerationService {
	return &ModerationService{
		reportsByID:    make(map[uuid.UUID]*db.Report),
		authService:    authService,
		disputeService: disputeService,
		orderService:   orderService,
		kycService:     kycService,
	}
}

func (s *ModerationService) CreateReport(ctx context.Context, reportedBy uuid.UUID, in CreateReportInput) (*db.Report, error) {
	if in.Reason == "" {
		return nil, errors.New("report reason is required")
	}

	if in.TargetID == uuid.Nil {
		return nil, errors.New("targetId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	report := &db.Report{
		ID:         uuid.New(),
		ReportedBy: reportedBy,
		TargetType: in.TargetType,
		TargetID:   in.TargetID,
		Reason:     in.Reason,
		Status:     db.ReportStatusOpen,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	s.reportsByID[report.ID] = report
	return report, nil
}

func (s *ModerationService) ListReports(ctx context.Context, status string, page, limit int) ([]db.Report, int, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []db.Report
	for _, r := range s.reportsByID {
		if status != "" && string(r.Status) != status {
			continue
		}
		list = append(list, *r)
	}

	sort.Slice(list, func(i, j int) bool {
		return list[i].CreatedAt.After(list[j].CreatedAt)
	})

	total := len(list)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	start := (page - 1) * limit
	if start > total {
		return []db.Report{}, total, nil
	}

	end := start + limit
	if end > total {
		end = total
	}

	return list[start:end], total, nil
}

func (s *ModerationService) DismissReport(ctx context.Context, reportID, adminID uuid.UUID, notes string) (*db.Report, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	report, exists := s.reportsByID[reportID]
	if !exists {
		return nil, errors.New("report not found")
	}

	now := time.Now()
	report.Status = db.ReportStatusDismissed
	report.ReviewedBy = &adminID
	report.ResolutionNotes = notes
	report.UpdatedAt = now

	return report, nil
}

func (s *ModerationService) SuspendUser(ctx context.Context, targetUserID, adminID uuid.UUID, reason string) error {
	user, err := s.authService.GetUserByID(ctx, targetUserID)
	if err != nil {
		return err
	}

	s.authService.Mu.Lock()
	user.IsSuspended = true
	user.UpdatedAt = time.Now()
	s.authService.Mu.Unlock()

	return nil
}

func (s *ModerationService) GetAdminSummary(ctx context.Context) (*AdminSummaryDTO, error) {
	s.mu.RLock()
	activeReports := 0
	for _, r := range s.reportsByID {
		if r.Status == db.ReportStatusOpen {
			activeReports++
		}
	}
	s.mu.RUnlock()

	s.disputeService.Mu.RLock()
	openDisputes := 0
	for _, d := range s.disputeService.DisputesByID {
		if d.Status != db.DisputeStatusResolved {
			openDisputes++
		}
	}
	s.disputeService.Mu.RUnlock()

	s.orderService.Mu.RLock()
	var totalEscrow float64 = 0.0
	var platformFeeEarned float64 = 0.0
	activeOrders := 0
	for _, o := range s.orderService.OrdersByID {
		if o.EscrowState == db.EscrowStateFundsHeld ||
			o.EscrowState == db.EscrowStateInTransit ||
			o.EscrowState == db.EscrowStateInspectionPeriod ||
			o.EscrowState == db.EscrowStateDisputed {
			totalEscrow += o.TotalAmount
			activeOrders++
		}
		if o.EscrowState == db.EscrowStateCompleted {
			platformFeeEarned += o.PlatformFee
		}
	}
	s.orderService.Mu.RUnlock()

	s.kycService.Mu.RLock()
	pendingKYC := 0
	for _, list := range s.kycService.Verifications {
		for _, v := range list {
			if v.Status == db.KYCPending || v.Status == db.KYCManualReviewRequired {
				pendingKYC++
			}
		}
	}
	s.kycService.Mu.RUnlock()

	s.authService.Mu.RLock()
	suspendedUsers := 0
	for _, u := range s.authService.UsersByID {
		if u.IsSuspended {
			suspendedUsers++
		}
	}
	s.authService.Mu.RUnlock()

	return &AdminSummaryDTO{
		OpenDisputesCount:   openDisputes,
		PendingKYCCount:     pendingKYC,
		ActiveReportsCount:  activeReports,
		TotalEscrowHeld:     totalEscrow,
		ActiveOrdersCount:   activeOrders,
		SuspendedUsersCount: suspendedUsers,
		PlatformFeeEarned:   platformFeeEarned,
		Currency:            "NGN",
	}, nil
}
