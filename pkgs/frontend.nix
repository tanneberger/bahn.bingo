{ pkgs, lib, config, mkYarnPackage, yarn }:
mkYarnPackage {
    name = "bahn-bingo-frontend";
    src = ../frontend/.;

    buildInputs = [ yarn ];

    buildPhase = ''
      #FILE=$(readlink ./deps/bahn-bingo-frontend/node_modules)
      #rm ./deps/bahn-bingo-frontend/node_modules
      #mkdir ./deps/bahn-bingo-frontend/node_modules
      #cp -r $FILE/ ./deps/bahn-bingo-frontend/
      #cp -r ./node_modules/* ./deps/bahn-bingo-frontend/node_modules/
    
      yarn build
    '';

    installPhase = ''
      mkdir -p $out/bin
      cp -r ./deps/bahn.bingo/dist/* $out/bin/
    '';

    doDist = false;


  meta = with lib; {
    description = "simple bingo frontend to shit on deutsche bahn";
    homepage = "https://github.com/revol-xut/bahn.bingo";
  };
}
