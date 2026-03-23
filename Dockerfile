# ==========================================
# GIAI ĐOẠN 1: Build Backend 
# ==========================================
# Thay vì gọi đích danh 8.14, ta chỉ cần gọi jdk25, Docker sẽ tự lo phần Gradle
FROM gradle:jdk25 AS build
WORKDIR /app/backend

# Copy toàn bộ nội dung thư mục backend vào container
COPY backend/ .

# Chạy lệnh build của Gradle (tạo ra file .jar) và bỏ qua chạy Test cho nhanh
RUN gradle clean bootJar -x test


# ==========================================
# GIAI ĐOẠN 2: Môi trường chạy siêu tiết kiệm RAM
# ==========================================
FROM eclipse-temurin:25-jre
WORKDIR /app

# Lấy file build
COPY --from=build /app/backend/build/libs/*.jar app.jar

EXPOSE 8080

# ⚠️ ÉP JAVA CHẠY VỚI 256MB RAM (Cực kỳ quan trọng)
ENV JAVA_OPTS="-Xmx128m -Xms64m -XX:+UseSerialGC -XX:MaxMetaspaceSize=96m -Xss256k"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]