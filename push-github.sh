#!/bin/bash

# Script para fazer push do ChatCRM para GitHub

cd /home/ubuntu/chatcrm

# Configurar git
git config --global user.email "contato@conexaomidia.com"
git config --global user.name "ChatCRM"

# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "ChatCRM - Versão Inicial Completa"

# Renomear branch para main
git branch -M main

# Adicionar remote
git remote add origin https://github.com/rocry-create/chatcrm.git

# Fazer push
git push -u origin main --force

echo "✓ Projeto enviado para GitHub com sucesso!"
