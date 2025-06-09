# stable-diffusion-webui/Dockerfile
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git wget curl software-properties-common \
    build-essential libgl1 libglib2.0-0 \
    zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev \
    libssl-dev libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev \
    && apt-get clean

# Install Python 3.10.6 from source
WORKDIR /tmp
RUN wget https://www.python.org/ftp/python/3.10.6/Python-3.10.6.tgz && \
    tar -xf Python-3.10.6.tgz && \
    cd Python-3.10.6 && \
    ./configure --enable-optimizations && \
    make -j$(nproc) && \
    make altinstall && \
    cd .. && rm -rf Python-3.10.6*

# Use Python 3.10.6 as default
RUN ln -sf /usr/local/bin/python3.10 /usr/bin/python3 && \
    ln -sf /usr/local/bin/pip3.10 /usr/bin/pip3 && \
    ln -sf /usr/local/bin/python3.10 /usr/bin/python && \
    ln -sf /usr/local/bin/pip3.10 /usr/bin/pip

# Set working directory
WORKDIR /app

# Clone AUTOMATIC1111 WebUI
RUN git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git /app

# Install Python dependencies
RUN pip install -r requirements.txt

# Install PyTorch with CUDA 12.1
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Optionally install xformers (for better performance)
RUN pip install xformers

# Create model directory (models will be mounted as a volume)
RUN mkdir -p /app/models/Stable-diffusion

EXPOSE 7860

CMD ["python", "launch.py", "--api", "--listen", "--cors-allow-origins=*"]