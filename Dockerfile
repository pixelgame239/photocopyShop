# ==========================================
# GIAI ĐOẠN 1: Build Backend với Gradle 8.14
# ==========================================
FROM gradle:8.14-jdk25 AS build
WORKDIR /app/backend

# Copy toàn bộ nội dung thư mục backend vào container
COPY backend/ .

# Chạy lệnh build của Gradle (tạo ra file .jar) và bỏ qua chạy Test cho nhanh
RUN gradle clean bootJar -x test


# ==========================================
# GIAI ĐOẠN 2: Môi trường chạy (Chỉ cần JRE cho nhẹ)
# ==========================================
FROM eclipse-temurin:25-jre
WORKDIR /app

# Khác với Maven (lưu ở target/), Gradle lưu file build ở thư mục build/libs/
COPY --from=build /app/backend/build/libs/*.jar app.jar

# Mở cổng 8080 (cổng mặc định của Spring Boot và Back4App)
EXPOSE 8080

# ⚠️ ÉP JAVA CHẠY VỚI 256MB RAM (KHÔNG ĐƯỢC XÀI 300MB NHÉ)
ENV JAVA_OPTS="-Xmx128m -Xms64m -XX:+UseSerialGC -XX:MaxMetaspaceSize=96m -Xss256k"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]