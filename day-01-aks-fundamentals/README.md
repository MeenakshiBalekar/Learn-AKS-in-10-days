# Day 1 — AKS Cluster Fundamentals

## Objective

Understand the core building blocks of Azure Kubernetes Service (AKS) and deploy a first workload.

By the end of Day 1:

- Understand AKS architecture basics
- Create an AKS cluster
- Deploy a sample application
- Expose it using a Service
- Observe Kubernetes self-healing

---

## What is AKS?

Azure Kubernetes Service (AKS) is a managed Kubernetes service on Azure.

Azure manages:

- Control Plane  
- API Server  
- Scheduler  
- etcd  

You manage:

- Node Pools  
- Containers  
- Applications  
- Kubernetes configurations

---

## Basic Architecture

```text
                 Users
                   |
             External IP
                   |
          Kubernetes Service
                   |
               AKS Cluster
        -------------------------
        |                       |
      Node 1                  Node 2
        |                       |
      Pod A                   Pod B
```

---

## Core Concepts

### Control Plane
The brain of Kubernetes.

Responsible for:
- Scheduling
- Cluster state
- API management

Managed by Azure in AKS.

---

### Node Pool
Group of worker nodes where workloads run.

---

### Pod
Smallest deployable unit in Kubernetes.

---

### Deployment
Manages:
- Replicas
- Rolling updates
- Self-healing

---

### Service
Provides stable access to workloads.

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

## Quick Start

### Create Resource Group

```bash
az group create \
--name aks-day1-rg \
--location eastus
```

---

## Create AKS Cluster

```bash
az aks create \
--resource-group aks-day1-rg \
--name day1akscluster \
--node-count 2 \
--enable-managed-identity \
--generate-ssh-keys
```

---

## Connect To Cluster

```bash
az aks get-credentials \
--resource-group aks-day1-rg \
--name day1akscluster
```

Verify nodes:

```bash
kubectl get nodes
```

Expected:

```bash
Ready
Ready
```

---

## Deploy First Application

Create deployment:

```bash
kubectl create deployment nginx-demo --image=nginx
```

Scale to 3 replicas:

```bash
kubectl scale deployment nginx-demo --replicas=3
```

Check pods:

```bash
kubectl get pods
```

---

## Deploy Using YAML

Apply deployment manifest:

```bash
kubectl apply -f deployment.yaml
```

Apply service:

```bash
kubectl apply -f service.yaml
```

Verify:

```bash
kubectl get pods
kubectl get svc
```

---

## Expose Application

```bash
kubectl expose deployment nginx-demo \
--port=80 \
--type=LoadBalancer
```

Check external IP:

```bash
kubectl get svc
```

Once IP appears, browse it.

You should see nginx running.

---

## Test Self-Healing

Delete a pod:

```bash
kubectl delete pod <pod-name>
```

Watch Kubernetes recreate it:

```bash
kubectl get pods
```

Observation:

Kubernetes automatically restores desired state.

---

## Key Concepts Learned

### Pod
Runs the containerized application.

### Deployment
Ensures desired number of replicas.

### Service
Exposes application traffic.

### Node
Virtual machine hosting workloads.

### Self-Healing
Failed pods are recreated automatically.

---

## Day 1 Takeaways

- Learned AKS control plane vs worker nodes
- Created a first AKS cluster
- Deployed first Kubernetes workload
- Used Services to expose applications
- Observed Kubernetes self-healing behavior

Big takeaway:

Kubernetes is not just container hosting — it is an orchestration platform.

---

## Questions for Further Learning

- How does Kubernetes scheduling work?
- What is the difference between Services and Ingress?
- How does autoscaling work in AKS?
- How are workloads secured in production AKS?

---

## Cleanup

Delete resources when done:

```bash
az group delete \
--name aks-day1-rg \
--yes --no-wait
```

Important:
Delete the resource group to avoid charges.

---

## Resources

Useful references:

AKS Documentation  
Kubernetes Basics  
Azure Architecture Center

(Links to be added)

---

## Next

Day 2 — Pods, Deployments and Services in Depth
