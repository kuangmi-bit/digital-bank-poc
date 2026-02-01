# 数字银行POC系统 - Terraform基础设施即代码配置
# 用于创建和管理Kubernetes集群、网络、存储等基础设施资源

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
  
  # 状态文件存储配置（根据实际情况调整）
  backend "local" {
    path = "terraform.tfstate"
  }
}

# 提供者配置
provider "kubernetes" {
  config_path    = var.kubeconfig_path
  config_context = var.kubeconfig_context
}

provider "helm" {
  kubernetes {
    config_path    = var.kubeconfig_path
    config_context = var.kubeconfig_context
  }
}

provider "docker" {
  host = var.docker_host
}

# 变量定义
variable "kubeconfig_path" {
  description = "Kubernetes配置文件路径"
  type        = string
  default     = "~/.kube/config"
}

variable "kubeconfig_context" {
  description = "Kubernetes上下文名称"
  type        = string
  default     = "default"
}

variable "docker_host" {
  description = "Docker守护进程地址"
  type        = string
  default     = "unix:///var/run/docker.sock"
}

variable "namespace" {
  description = "Kubernetes命名空间"
  type        = string
  default     = "digital-bank-poc"
}

variable "environment" {
  description = "环境名称 (dev, qa, uat, prod)"
  type        = string
  default     = "dev"
}

# 命名空间资源
resource "kubernetes_namespace" "digital_bank_poc" {
  metadata {
    name = var.namespace
    labels = {
      app         = "digital-bank-poc"
      environment = var.environment
      managed-by  = "terraform"
    }
  }
}

# Consul服务注册中心配置
resource "kubernetes_deployment" "consul_server" {
  metadata {
    name      = "consul-server"
    namespace = kubernetes_namespace.digital_bank_poc.metadata[0].name
    labels = {
      app = "consul"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "consul"
      }
    }

    template {
      metadata {
        labels = {
          app = "consul"
        }
      }

      spec {
        container {
          name  = "consul"
          image = "consul:1.17.0"

          args = [
            "agent",
            "-server",
            "-ui",
            "-bootstrap-expect=1",
            "-client=0.0.0.0",
            "-bind=0.0.0.0",
            "-data-dir=/consul/data"
          ]

          port {
            container_port = 8500
            name           = "http"
          }

          port {
            container_port = 8600
            name           = "dns"
            protocol       = "UDP"
          }

          volume_mount {
            name       = "consul-data"
            mount_path = "/consul/data"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }
        }

        volume {
          name = "consul-data"
          empty_dir {}
        }
      }
    }
  }
}

resource "kubernetes_service" "consul_server" {
  metadata {
    name      = "consul-server"
    namespace = kubernetes_namespace.digital_bank_poc.metadata[0].name
    labels = {
      app = "consul"
    }
  }

  spec {
    selector = {
      app = "consul"
    }

    port {
      name        = "http"
      port        = 8500
      target_port = 8500
    }

    port {
      name        = "dns"
      port        = 8600
      target_port = 8600
      protocol    = "UDP"
    }

    type = "ClusterIP"
  }
}

# Kong API Gateway配置
resource "kubernetes_deployment" "kong" {
  metadata {
    name      = "kong"
    namespace = kubernetes_namespace.digital_bank_poc.metadata[0].name
    labels = {
      app = "kong"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "kong"
      }
    }

    template {
      metadata {
        labels = {
          app = "kong"
        }
      }

      spec {
        container {
          name  = "kong"
          image = "kong:3.4"

          env {
            name  = "KONG_DATABASE"
            value = "off"
          }

          env {
            name  = "KONG_DECLARATIVE_CONFIG"
            value = "/kong/kong.yml"
          }

          env {
            name  = "KONG_PROXY_ACCESS_LOG"
            value = "/dev/stdout"
          }

          env {
            name  = "KONG_ADMIN_ACCESS_LOG"
            value = "/dev/stdout"
          }

          env {
            name  = "KONG_PROXY_ERROR_LOG"
            value = "/dev/stderr"
          }

          env {
            name  = "KONG_ADMIN_ERROR_LOG"
            value = "/dev/stderr"
          }

          env {
            name  = "KONG_ADMIN_LISTEN"
            value = "0.0.0.0:8001"
          }

          port {
            container_port = 8000
            name           = "proxy"
          }

          port {
            container_port = 8443
            name           = "proxy-ssl"
          }

          port {
            container_port = 8001
            name           = "admin"
          }

          port {
            container_port = 8444
            name           = "admin-ssl"
          }

          volume_mount {
            name       = "kong-config"
            mount_path = "/kong/kong.yml"
            sub_path   = "kong.yml"
            read_only  = true
          }

          resources {
            requests = {
              cpu    = "200m"
              memory = "512Mi"
            }
            limits = {
              cpu    = "1000m"
              memory = "1Gi"
            }
          }
        }

        volume {
          name = "kong-config"
          config_map {
            name = kubernetes_config_map.kong_config.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_config_map" "kong_config" {
  metadata {
    name      = "kong-config"
    namespace = kubernetes_namespace.digital_bank_poc.metadata[0].name
  }

  data = {
    "kong.yml" = file("${path.module}/../kong/kong.yml")
  }
}

resource "kubernetes_service" "kong" {
  metadata {
    name      = "kong"
    namespace = kubernetes_namespace.digital_bank_poc.metadata[0].name
    labels = {
      app = "kong"
    }
  }

  spec {
    selector = {
      app = "kong"
    }

    port {
      name        = "proxy"
      port        = 8000
      target_port = 8000
    }

    port {
      name        = "admin"
      port        = 8001
      target_port = 8001
    }

    type = "LoadBalancer"
  }
}

# Nginx反向代理配置
resource "kubernetes_deployment" "nginx" {
  metadata {
    name      = "nginx"
    namespace = kubernetes_namespace.digital_bank_poc.metadata[0].name
    labels = {
      app = "nginx"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "nginx"
      }
    }

    template {
      metadata {
        labels = {
          app = "nginx"
        }
      }

      spec {
        container {
          name  = "nginx"
          image = "nginx:1.25-alpine"

          port {
            container_port = 80
          }

          port {
            container_port = 443
          }

          volume_mount {
            name       = "nginx-config"
            mount_path = "/etc/nginx/nginx.conf"
            sub_path   = "nginx.conf"
            read_only  = true
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "256Mi"
            }
          }
        }

        volume {
          name = "nginx-config"
          config_map {
            name = kubernetes_config_map.nginx_config.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_config_map" "nginx_config" {
  metadata {
    name      = "nginx-config"
    namespace = kubernetes_namespace.digital_bank_poc.metadata[0].name
  }

  data = {
    "nginx.conf" = file("${path.module}/../nginx/nginx.conf")
  }
}

resource "kubernetes_service" "nginx" {
  metadata {
    name      = "nginx"
    namespace = kubernetes_namespace.digital_bank_poc.metadata[0].name
    labels = {
      app = "nginx"
    }
  }

  spec {
    selector = {
      app = "nginx"
    }

    port {
      name        = "http"
      port        = 80
      target_port = 80
    }

    port {
      name        = "https"
      port        = 443
      target_port = 443
    }

    type = "LoadBalancer"
  }
}

# 输出值
output "namespace" {
  description = "创建的命名空间名称"
  value       = kubernetes_namespace.digital_bank_poc.metadata[0].name
}

output "consul_service" {
  description = "Consul服务地址"
  value       = "${kubernetes_service.consul_server.metadata[0].name}.${kubernetes_namespace.digital_bank_poc.metadata[0].name}.svc.cluster.local:8500"
}

output "kong_proxy_url" {
  description = "Kong API Gateway代理地址"
  value       = "http://${kubernetes_service.kong.metadata[0].name}.${kubernetes_namespace.digital_bank_poc.metadata[0].name}.svc.cluster.local:8000"
}

output "kong_admin_url" {
  description = "Kong API Gateway管理地址"
  value       = "http://${kubernetes_service.kong.metadata[0].name}.${kubernetes_namespace.digital_bank_poc.metadata[0].name}.svc.cluster.local:8001"
}

output "nginx_service_url" {
  description = "Nginx服务地址"
  value       = "http://${kubernetes_service.nginx.metadata[0].name}.${kubernetes_namespace.digital_bank_poc.metadata[0].name}.svc.cluster.local:80"
}
