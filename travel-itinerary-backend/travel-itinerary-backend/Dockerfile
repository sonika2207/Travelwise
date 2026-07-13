# Stage 1: Build the application
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy the maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Ensure the maven wrapper script is executable
RUN chmod +x mvnw

# Download dependencies (this layer will be cached)
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Expose port 8080
EXPOSE 8080

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Run the application with optimized settings for Render Free tier (512MB limit)
ENTRYPOINT ["java", "-Xmx256m", "-XX:+UseSerialGC", "-jar", "app.jar"]
