#!/bin/bash

subgraphFolderName=""

if [ -n "$subgraphFolderName" ]; then
  if [ -d "./subgraphs/$subgraphFolderName" ]; then
    echo "[ERROR] Directory is exists"
  else
    echo "[BASH] Generating new subgraph folder"

    cp -R ./.subgraph.template/ subgraphs/$subgraphFolderName

    find ./subgraphs/$subgraphFolderName -name "*.gitkeep" -type f -exec rm {} \;

    echo "[BASH] Generated"
  fi
else
  echo "[ERROR] Missing subgraph folder name"
fi
