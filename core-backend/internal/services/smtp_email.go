package services

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"net"
	"net/mail"
	"net/smtp"
	"os"
	"strconv"
	"strings"
	"time"
)

type EmailSender interface {
	Configured() bool
	Send(context.Context, string, string, string) error
}

type SMTPEmailSender struct {
	host     string
	port     string
	username string
	password string
	from     string
}

func NewSMTPEmailSenderFromEnv() *SMTPEmailSender {
	port := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	if port == "" {
		port = "587"
	}
	return &SMTPEmailSender{
		host:     strings.TrimSpace(os.Getenv("SMTP_HOST")),
		port:     port,
		username: strings.TrimSpace(os.Getenv("SMTP_USER")),
		password: os.Getenv("SMTP_PASSWORD"),
		from:     strings.TrimSpace(os.Getenv("SMTP_FROM_EMAIL")),
	}
}

func (s *SMTPEmailSender) Configured() bool {
	return s.host != "" && s.port != "" && s.username != "" && s.password != "" && s.from != ""
}

func (s *SMTPEmailSender) Send(ctx context.Context, recipient, subject, body string) error {
	if !s.Configured() {
		return errors.New("SMTP email delivery is not configured")
	}
	if err := ctx.Err(); err != nil {
		return err
	}
	from, err := mail.ParseAddress(s.from)
	if err != nil {
		return fmt.Errorf("invalid SMTP_FROM_EMAIL: %w", err)
	}
	to, err := mail.ParseAddress(recipient)
	if err != nil {
		return errors.New("invalid email recipient")
	}
	if strings.ContainsAny(subject, "\r\n") {
		return errors.New("email subject contains invalid characters")
	}

	message := strings.Join([]string{
		"From: " + from.String(),
		"To: " + to.String(),
		"Subject: " + subject,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}, "\r\n")
	port, err := strconv.Atoi(s.port)
	if err != nil || port < 1 || port > 65535 {
		return errors.New("SMTP_PORT must be a valid TCP port")
	}
	address := net.JoinHostPort(s.host, s.port)
	auth := smtp.PlainAuth("", s.username, s.password, s.host)
	dialer := &net.Dialer{Timeout: 15 * time.Second}
	var conn net.Conn
	if port == 465 {
		tlsDialer := &tls.Dialer{NetDialer: dialer, Config: &tls.Config{
			ServerName: s.host,
			MinVersion: tls.VersionTLS12,
		}}
		conn, err = tlsDialer.DialContext(ctx, "tcp", address)
	} else {
		conn, err = dialer.DialContext(ctx, "tcp", address)
	}
	if err != nil {
		return fmt.Errorf("connect to SMTP server: %w", err)
	}
	defer conn.Close()
	if deadline, ok := ctx.Deadline(); ok {
		if err := conn.SetDeadline(deadline); err != nil {
			return fmt.Errorf("set SMTP deadline: %w", err)
		}
	}

	client, err := smtp.NewClient(conn, s.host)
	if err != nil {
		return fmt.Errorf("create SMTP client: %w", err)
	}
	defer client.Close()
	if port != 465 {
		if ok, _ := client.Extension("STARTTLS"); !ok {
			return errors.New("SMTP server does not offer STARTTLS")
		}
		if err := client.StartTLS(&tls.Config{ServerName: s.host, MinVersion: tls.VersionTLS12}); err != nil {
			return fmt.Errorf("start TLS for SMTP connection: %w", err)
		}
	}
	if err := client.Auth(auth); err != nil {
		return fmt.Errorf("authenticate with SMTP server: %w", err)
	}
	if err := client.Mail(from.Address); err != nil {
		return fmt.Errorf("set SMTP sender: %w", err)
	}
	if err := client.Rcpt(to.Address); err != nil {
		return fmt.Errorf("set SMTP recipient: %w", err)
	}
	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("start SMTP message: %w", err)
	}
	if _, err := writer.Write([]byte(message)); err != nil {
		_ = writer.Close()
		return fmt.Errorf("write SMTP message: %w", err)
	}
	if err := writer.Close(); err != nil {
		return fmt.Errorf("finish SMTP message: %w", err)
	}
	if err := client.Quit(); err != nil {
		return fmt.Errorf("close SMTP session: %w", err)
	}
	return nil
}
