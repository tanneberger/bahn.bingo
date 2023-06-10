{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    naersk = {
      url = "github:nix-community/naersk";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    utils = {
      url = "github:numtide/flake-utils";
    };

    fenix = {
      url = "github:nix-community/fenix";
      #inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ self
    , nixpkgs
    , naersk
    , utils
    , fenix
    , ...
    }:
    utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" ]
      (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        toolchain = with fenix.packages.${system}; combine [
          latest.cargo
          latest.rustc
        ];

        bahn-bingo-backend = pkgs.callPackage ./pkgs/backend.nix {
          buildPackage = (naersk.lib.${system}.override {
            cargo = toolchain;
            rustc = toolchain;
          }).buildPackage;
        };
        bahn-bingo-frontend = pkgs.callPackage ./pkgs/frontend.nix {};

        test-vm-pkg = self.nixosConfigurations.bahn-bingo-backend-mctest.config.system.build.vm;
      in
      rec {
        checks = packages;
        packages = {
          bahn-bingo-backend = bahn-bingo-backend;
          bahn-bingo-frontend = bahn-bingo-frontend;
          default = bahn-bingo-backend;
        };
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = (with packages.bahn-bingo-backend; nativeBuildInputs ++ buildInputs);
        };
      }
      ) // {
      overlays.default = final: prev: {
        inherit (self.packages.${prev.system})
        bahn-bingo-backend bahn-bingo-frontend;
      };
      nixosModules = rec {
        default = bahn-bingo-backend;
        bahn-bingo-backend = import ./nixos-module;
      };

      hydraJobs =
        let
          hydraSystems = [
            "x86_64-linux"
            "aarch64-linux"
          ];
        in
        builtins.foldl'
          (hydraJobs: system:
            builtins.foldl'
              (hydraJobs: pkgName:
                nixpkgs.lib.recursiveUpdate hydraJobs {
                  ${pkgName}.${system} = self.packages.${system}.${pkgName};
                }
              )
              hydraJobs
              (builtins.attrNames self.packages.${system})
          )
          { }
          hydraSystems;
    };
}
