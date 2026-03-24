package com.vfms.auth.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    public void sendApprovalEmail(String email, String fullName, String roleName) {
        // TODO: Implement email sending using JavaMailSender
        System.out.println("Send approval email to: " + email);
    }
    
    public void sendRejectionEmail(String email, String fullName, String rejectionReason) {
        // TODO: Implement email sending using JavaMailSender
        System.out.println("Send rejection email to: " + email);
    }
    
    public void sendVerificationEmail(String email, String verificationToken) {
        // TODO: Implement email sending using JavaMailSender
        System.out.println("Send verification email to: " + email);
    }
}
