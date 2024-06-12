#!/bin/bash

# Never set eux here otherwise it will break the CI

# ALL_PACKAGES
packages=(
  "common"
  "core"
  "draw"
  "flow"
  "layouts"
  "mind"
  "text-plugins"
  "angular-text"
  "angular-board"
)

npm run build

for package in "${packages[@]}"
do
  cd "dist/$package"

  npm publish --access public

  cd ../../
done
