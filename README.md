## Installation

Install this project with npm

```bash
  git clone <project repository>
  cd <project folder>
  npm install

  npm run dev

```

## Docker containers

docker run -d --hostname rabbitmq --name my-rabbit -p 15672:15672 -p 5672:5672 rabbitmq:3-management 
docker run -d --name dev-vault -p 8200:8200 --cap-add=IPC_LOCK -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' vault:1.13.3
