{ pkgs, lib, config, mkYarnPackage, yarn }:
mkYarnPackage {
    name = "bahn.bingo-frontend";
    src = ../frontend/.;

    buildInputs = [ yarn ];

    #buildPhase = ''
    #  FILE=$(readlink ./deps/kindergarten/node_modules)
    #  rm ./deps/kindergarten/node_modules
    #  mkdir ./deps/kindergarten/node_modules
    #  cp -r $FILE/ ./deps/kindergarten/
    #  cp -r ./node_modules/* ./deps/kindergarten/node_modules/
    #
    #  yarn run build:ci
    #'';

    #installPhase = ''
    #  mkdir -p $out/bin/en
    #  mkdir -p $out/bin/de
    #  cp -r ./deps/kindergarten/dist/en-US/* $out/bin/en/
    #  cp -r ./deps/kindergarten/dist/de-DE/* $out/bin/de/
    #'';

    doDist = false;


  meta = with lib; {
    description = "simple bingo frontend to shit on deutsche bahn";
    homepage = "https://github.com/revol-xut/bahn.bingo";
  };
}
