package com.luissilva.backend.mail.imap.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MailMessageDetailDto {

    private long uid;
    private String from;
    private String to;
    private String subject;
    private String body;
    private String sentAt;
    private boolean seen;
}