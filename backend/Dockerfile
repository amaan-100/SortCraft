# ---- Build stage: compile the Spring Boot jar with Maven ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B -q dependency:go-offline || true

COPY src ./src
RUN mvn -B -q package -DskipTests

# ---- Runtime stage: a small JRE-only image ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Non-root user, following Render's security guidance.
RUN groupadd --system app && useradd --system --gid app app
USER app

COPY --from=build /app/target/sortcraft-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]