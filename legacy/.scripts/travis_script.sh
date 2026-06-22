#!/usr/bin/env bash

set -e

if [ `uname` = "Linux" ]; then
  mkdir -p $HOME/bin;
  # symlink to get gcc5 and g++ to work
  ln -s /usr/bin/gcc-5 $HOME/bin/gcc;
  ln -s /usr/bin/g++-5 $HOME/bin/g++;
  ln -s /usr/bin/gfortran-5 $HOME/bin/gfortran;
  ln -s /usr/bin/gcc-5 $HOME/bin/x86_64-linux-gnu-gcc;
  ln -s /usr/bin/g++-5 $HOME/bin/x86_64-linux-gnu-g++;
  # ln -s /usr/include/asm /usr/include/asm-generic;
  gcc --version;
  npm run build:linux:$ARCH;
elif [ `uname` = "Darwin" ]; then
  npm run build:osx:verbose;
fi

set +e
