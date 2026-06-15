FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw ./
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline

COPY src src
RUN ./mvnw -q -DskipTests clean package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN useradd --system --create-home --uid 1001 questio
COPY --from=build /app/target/questio-backend-0.0.1-SNAPSHOT.jar app.jar
USER questio
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
