# 核心银行服务 - Dockerfile 模板
# 镜像: digitalbank/core-bank-service (kebab-case)
# 多阶段构建: Maven 编译 + JRE 运行

FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn -B -Dmaven.repo.local=/tmp/m2 dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests -Dmaven.repo.local=/tmp/m2 package && \
    cp target/*.jar /app/app.jar

FROM eclipse-temurin:17-jre
WORKDIR /app

RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app
USER app

COPY --from=builder /app/app.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
