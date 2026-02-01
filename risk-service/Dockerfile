# 风控服务 - Dockerfile 模板
# 镜像: digitalbank/risk-service (kebab-case)

FROM python:3.11-slim

WORKDIR /app

RUN useradd -m -u 1000 app
USER app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
# 若入口不同，请修改为: CMD ["python", "-m", "src.main"] 等
