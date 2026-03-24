package com.photocopy.backend.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.photocopy.backend.exception.InternalServerException;
import com.photocopy.backend.exception.NotFoundException;
import com.photocopy.backend.exception.UnauthorizedException;
import com.photocopy.backend.utils.FileUtils;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    @Value("${supabase.s3.storage.public-url-prefix}") 
    private String publicUrlPrefix;
    public String uploadFile(MultipartFile file, String bucketName, Authentication authentication) {
        try{
            if ("products".equals(bucketName)) {
                boolean isAdmin = authentication.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin) {
                    throw new UnauthorizedException("You do not have permission to upload files to this bucket");
                }
            }
            String originalFilename = file.getOriginalFilename();
            String safeFileName = FileUtils.sanitizeFileName(originalFilename);
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(safeFileName)
                    .contentType(file.getContentType())
                    .build();
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return publicUrlPrefix + "/" + bucketName + "/" + safeFileName;
        } catch (Exception e) {
            throw new InternalServerException("Lỗi upload file: " + e.getMessage());
        }
    }
    public String uploadPrivateFile(MultipartFile file, String bucketName) {
        try{
            String originalFilename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String safeFileName = FileUtils.sanitizeFileName(originalFilename);
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(safeFileName)
                    .contentType(file.getContentType())
                    .build();
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return originalFilename;
        } catch (Exception e) {
            throw new InternalServerException("Lỗi upload file: " + e.getMessage());
        }
    }
    public String generatePresignedUrl(String fileName, String bucketName, Authentication authentication) {
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GUEST"))) {
            throw new UnauthorizedException("You do not have permission to access files from this bucket");
        }
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .responseContentDisposition("attachment; filename=\"" + fileName + "\"")
                    .build();
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(15))
                    .getObjectRequest(getObjectRequest)
                    .build();        
            return s3Presigner.presignGetObject(presignRequest).url().toString();
        } catch (Exception e) {
            throw new InternalServerException("Lỗi tạo URL truy cập file: " + e.getMessage());
        }
    }

    public void deleteFile(String fileUrl, String bucketName, Authentication authentication) {
        try {
            String key;
            if ("products".equals(bucketName)) {
                boolean isAdmin = authentication.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin) {
                    throw new UnauthorizedException("You do not have permission to delete files from this bucket");
                }
                key = fileUrl.replace(publicUrlPrefix + "/" + bucketName + "/", "");               
            }
            else if("orders".equals(bucketName)) {
                key = fileUrl;        
            }
            else {
                throw new NotFoundException("Invalid bucket name: " + bucketName);
            }
            s3Client.deleteObject(builder -> builder.bucket(bucketName).key(key).build());
        } catch (Exception e) {
            throw new InternalServerException("Lỗi xoá file: " + e.getMessage());
        }
    }
}
