{ buildPackage, src, lib, pkg-config, gio-sharp, gdk-pixbuf}:

buildPackage {
  pname = "bahn.bingo-backend";
  version = "0.1.0";

  src = ../.;

  cargoSha256 = lib.fakeSha256;

  nativeBuildInputs = [ pkg-config ];

  meta = with lib; {
    description = "simple rust server which renders bingo fields ";
    homepage = "https://github.com/revol-xut/bahn.bingo";
  };
}
