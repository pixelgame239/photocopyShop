package com.photocopy.backend.dto.request;

import lombok.Getter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
public class SignupRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    // OTP provided by user to complete signup (6 digits)
    private String otp;
}
