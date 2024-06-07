{ pkgs, lib, stdenv }:
pkgs.stdenv.mkDerivation {
    name = "bahn-bingo-frontend";
    src = ../frontend/.;
    phases = ["unpackPhase" "installPhase" ];
    
    installPhase = ''
      mkdir -p $out/bin
      cp -r ./* $out/bin
    '';
  }
