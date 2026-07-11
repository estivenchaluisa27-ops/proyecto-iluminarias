FROM python:3.12

WORKDIR /app

COPY analytics/requirements.txt .
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

COPY analytics/ .

COPY data /data
ENV ANALYTICS_DATA_DIR=/data

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
