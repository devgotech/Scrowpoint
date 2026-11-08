package db

import "testing"

func TestCalculateEscrowQuoteUsesFeeTiersAndCurrencyDefault(t *testing.T) {
	tests := []struct {
		name         string
		price        float64
		currency     string
		wantRate     float64
		wantFee      float64
		wantTotal    float64
		wantCurrency string
	}{
		{name: "entry tier", price: 100000, wantRate: .05, wantFee: 5000, wantTotal: 105000, wantCurrency: "NGN"},
		{name: "standard tier", price: 200000, currency: "USD", wantRate: .025, wantFee: 5000, wantTotal: 205000, wantCurrency: "USD"},
		{name: "high volume tier", price: 1000000, wantRate: .015, wantFee: 15000, wantTotal: 1015000, wantCurrency: "NGN"},
		{name: "rounds to cents", price: 123.456, wantRate: .05, wantFee: 6.17, wantTotal: 129.63, wantCurrency: "NGN"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			quote, err := CalculateEscrowQuote(test.price, test.currency)
			if err != nil {
				t.Fatalf("CalculateEscrowQuote returned error: %v", err)
			}
			if quote.FeeTierRate != test.wantRate || quote.PlatformFee != test.wantFee ||
				quote.TotalDue != test.wantTotal || quote.Currency != test.wantCurrency {
				t.Errorf("quote = %+v, want rate=%v fee=%v total=%v currency=%q",
					quote, test.wantRate, test.wantFee, test.wantTotal, test.wantCurrency)
			}
		})
	}
}

func TestCalculateEscrowQuoteRejectsNonPositivePrice(t *testing.T) {
	for _, price := range []float64{0, -0.01} {
		if _, err := CalculateEscrowQuote(price, "NGN"); err == nil {
			t.Errorf("CalculateEscrowQuote(%v) accepted a non-positive price", price)
		}
	}
}

func TestValidateStateTransition(t *testing.T) {
	tests := []struct {
		name    string
		current EscrowState
		next    EscrowState
		wantErr bool
	}{
		{name: "created to payment pending", current: EscrowStateCreated, next: EscrowStatePendingPayment},
		{name: "inspection to dispute", current: EscrowStateInspectionPeriod, next: EscrowStateDisputed},
		{name: "completed is terminal", current: EscrowStateCompleted, next: EscrowStateRefunded, wantErr: true},
		{name: "unknown current state", current: "unknown", next: EscrowStateFundsHeld, wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := ValidateStateTransition(test.current, test.next)
			if (err != nil) != test.wantErr {
				t.Fatalf("ValidateStateTransition(%q, %q) error = %v, wantErr=%v",
					test.current, test.next, err, test.wantErr)
			}
		})
	}
}

func TestGenerateSKU(t *testing.T) {
	got := GenerateSKU(" smartphone ", " Apple ", "iPhone 14 Pro", " 256GB ", ConditionGood)
	want := "PHN-APPLE-IPHONE14PRO-256GB-GOOD"
	if got != want {
		t.Errorf("GenerateSKU() = %q, want %q", got, want)
	}
}
