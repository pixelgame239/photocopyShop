package com.photocopy.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ChatRequest {
    @NotBlank(message = "Sender không được để trống")
    private String sender;
    @NotBlank(message = "Receiver không được để trống")
    private String receiver;
    @NotBlank(message = "Content không được để trống")
    private String content;
}
