#!/usr/bin/env bash

mkdir .releases

set -e

if [ `uname` = "Linux" ]; then
  if [ "$ARCH" == "x64" ]; then
    npm run test:build .dist/linux-unpacked/grandview
    mv .dist/${APP}_${VERSION}_amd64.deb .releases/${APP}_${TAG}_amd64.deb;
    mv .dist/${APP}-${VERSION}-x86_64.AppImage; .releases/${APP}-${TAG}-x86_64.AppImage;
  elif [ "$ARCH" == "x86" ]; then
    npm run test:build .dist/linux-ia32-unpacked/grandview;
    mv .dist/${APP}_${VERSION}_i386.deb .releases/${APP}_${TAG}_i386.deb;
    mv .dist/${APP}-${VERSION}-i386.AppImage .releases/${APP}-${TAG}-i386.AppImage;
  fi
  mv ${APP}-${TAG}-${OS}-${ARCH_NAME}.tar.gz .releases
elif [ `uname` = "Darwin" ]; then
  npm run test:build .dist/mac/GrandView.app/Contents/MacOS/GrandView;
  mv .dist/${APP}-${VERSION}.dmg .releases/${APP}-${TAG}-${OS}-${ARCH_NAME}.dmg;
  mv ${APP}-${TAG}-${OS}-${ARCH_NAME}.tar.gz .releases/${APP}-${TAG}-${OS}-${ARCH_NAME}.tar.gz;
fi

set +e
