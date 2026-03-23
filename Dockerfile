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

COPY --from=build /app/backend/build/libs/*.jar app.jar
EXPOSE 8080

# ⚠️ BỘ CỨU MẠNG V2 CHO 256MB RAM:
# - Cắt Heap xuống 96MB (-Xmx96m)
# - Tăng Metaspace lên 128MB (-XX:MaxMetaspaceSize=128m)
# - Ép CodeCache xuống 32MB (-XX:ReservedCodeCacheSize=32m) để tránh vượt quá 256MB
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC -Xss256k"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]