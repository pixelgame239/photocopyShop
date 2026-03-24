package com.photocopy.backend.utils;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class FileUtils {
    public static String sanitizeFileName(String fileName) {
        String temp = Normalizer.normalize(fileName, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String noAccent = pattern.matcher(temp).replaceAll("");
        noAccent = noAccent.replace("đ", "d").replace("Đ", "D");
        String sanitized = noAccent.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
        return sanitized;
    }
}
