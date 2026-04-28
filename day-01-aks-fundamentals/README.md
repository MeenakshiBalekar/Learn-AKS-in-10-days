# Day 1 — AKS Cluster Fundamentals
## Repository Structure

```text
day-01-aks-fundamentals/
├── README.md
├── deployment.yaml
├── service.yaml
├── notes.md
└── diagrams/
    └── aks-basic-architecture.png
```

## Objective
Understand core AKS building blocks and deploy a first workload.

By the end of Day 1:

- Understand AKS architecture
- Create an AKS cluster
- Deploy a sample application
- Expose it using a Service
- Observe Kubernetes self-healing

---

# What is AKS?

Azure Kubernetes Service (AKS) is a managed Kubernetes service.

Azure manages:
- Control Plane
- API Server
- Scheduler
- etcd

You manage:
- Node Pools
- Containers
- Applications

---

# Basic Architecture

Users  
↓  
Service / External IP  
↓  
AKS Cluster  
↓  
Pods running on worker nodes

(See architecture diagram in diagrams folder)

---

# Prerequisites

Install:

- Azure CLI
- kubectl

Login:

```bash
az login
```

Verify kubectl:

```bash
kubectl version --client
```

---

# Step 1 Create Resource Group

```bash
az group create \
--name aks-day1-rg \
--location eastus
```

---

# Step 2 Create AKS Cluster

```bash
az aks create \
--resource-group aks-day1-rg \
--name day1akscluster \
--node-count 2 \
--enable-managed-identity \
--generate-ssh-keys
```

---

# Step 3 Connect To Cluster

```bash
az aks get-credentials \
--resource-group aks-day1-rg \
--name day1akscluster
```

Verify:

```bash
kubectl get nodes
```

Expected:
2 nodes in Ready state.

---

# Step 4 Deploy First Application

```bash
kubectl create deployment nginx-demo --image=nginx
```

Scale:

```bash
kubectl scale deployment nginx-demo --replicas=3
```

Check pods:

```bash
kubectl get pods
```

---

# Step 5 Expose Application

```bash
kubectl expose deployment nginx-demo \
--port=80 \
--type=LoadBalancer
```

Check service:

```bash
kubectl get svc
```

Browse external IP once assigned.

---

# Step 6 Test Self-Healing

Delete a pod:

```bash
kubectl delete pod <pod-name>
```

Observe:

```bash
kubectl get pods
```

Kubernetes recreates it automatically.

---

# Key Concepts Learned

## Pod
Smallest deployable unit.

## Deployment
Manages replicas and self-healing.

## Service
Stable access endpoint for applications.

## Node
Virtual machine running workloads.

---

# Cleanup

Delete resources when done:

```bash
az group delete \
--name aks-day1-rg \
--yes --no-wait
```

Important to avoid charges.

---

# Next
Day 2:
Pods, Deployments and Services in depth
