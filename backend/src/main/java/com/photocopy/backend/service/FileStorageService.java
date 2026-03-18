package com.photocopy.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private final S3Client s3Client;
    @Value("${supabase.s3.storage.public-url-prefix}") 
    private String publicUrlPrefix;
    public String uploadFile(MultipartFile file, String bucketName, Authentication authentication) {
        try{
            if ("products".equals(bucketName)) {
                boolean isAdmin = authentication.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin) {
                    throw new RuntimeException("You do not have permission to upload files to this bucket");
                }
            }
            String originalFilename = file.getOriginalFilename();
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(originalFilename)
                    .contentType(file.getContentType())
                    .build();
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return publicUrlPrefix + "/" + bucketName + "/" + originalFilename;
        } catch (Exception e) {
            throw new RuntimeException("Error uploading file to S3: " + e.getMessage(), e);
        }
    }
    public void deleteFile(String fileUrl, String bucketName, Authentication authentication) {
        try {
            if ("products".equals(bucketName)) {
                boolean isAdmin = authentication.getAuthorities().stream()
                        .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
                if (!isAdmin) {
                    throw new RuntimeException("You do not have permission to delete files from this bucket");
                }
            }
            String key = fileUrl.replace(publicUrlPrefix + "/" + bucketName + "/", "");
            s3Client.deleteObject(builder -> builder.bucket(bucketName).key(key).build());
        } catch (Exception e) {
            throw new RuntimeException("Error deleting file from S3: " + e.getMessage(), e);
        }
    }
}
