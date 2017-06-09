#!/usr/bin/env bash

if [ `uname` = "Linux" ]; then
  mkdir -p $HOME/bin;
  # symlink to get gcc5 and g++ to work
  ln -s /usr/bin/gcc-5 $HOME/bin/gcc;
  ln -s /usr/bin/g++-5 $HOME/bin/g++;
  ln -s /usr/bin/gfortran-5 $HOME/bin/gfortran;
  ln -s /usr/bin/gcc-5 $HOME/bin/x86_64-linux-gnu-gcc;
  ln -s /usr/bin/g++-5 $HOME/bin/x86_64-linux-gnu-g++;
  ln -s /usr/include/asm /usr/include/asm-generic;
  gcc --version;
  npm run build:linux:$ARCH;
  if [ "$ARCH" == "x64" ]; then
    tar -zcf GrandView-${TAG}-${OS}-${ARCH_NAME}.tar.gz -C .dist/linux-unpacked .;
  elif [ "$ARCH" == "x86" ]; then
    tar -zcf GrandView-${TAG}-${OS}-${ARCH_NAME}.tar.gz -C .dist/linux-ia32-unpacked .;
  fi
elif [ `uname` = "Darwin" ]; then
  npm run build:osx:verbose;
  tar -zcf GrandView-${TAG}-${OS}-${ARCH_NAME}.tar.gz .dist/GrandView-${VERSION}.dmg;
fi
