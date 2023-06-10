{ pkgs, config, lib, ... }:
let
  cfg = config.TLMS.datacare;
in
{
  options.bahn-bingo = with lib; {
    enable = mkOption {
      type = types.bool;
      default = false;
      description = ''
        Wether to enable bahn-bingo service
      '';
    };
    rustBacktrace = mkOption {
      type = types.str;
      default = "FULL";
      description = ''rust backtrace'';
    };

    http = {
      host = mkOption {
        type = types.str;
        default = "127.0.0.1";
        description = ''host of datacare'';
      };
      port = mkOption {
        type = types.port;
        default = 5070;
        description = ''port of datacare'';
      };
    };
    pictureFolder = mkOption {
      type = types.str;
      default = "/var/lib/bahn-bingo/pictures/";
      description = ''where the service should drop its images'';
    };
    bingoTemplate = mkOption {
      type = types.str;
      default = "/var/lib/bahn-bingo/template.svg";
      description = ''where the bingo field template lives'';
    };
    bingoFieldConfig = mkOption {
      type = types.str;
      default = "${../bingo-values.json}"
      description = ''enum text mapping'';
    };
    domains = {
      websiteDomain = mkOption {
        type = types.str;
        default = "bahn.bingo";
        description = ''where the frontend should be served'';
      };
      apiDomain = mkOption {
        type = types.str;
        default = "api.bahn.bingo";
        description = ''where the sharepic api builder should listen'';
      };
      filesDomain = mkOption {
        type = types.str;
        default = "files.bahn.bingo";
        description = ''where the pictures should be '';
      };
    };
    user = mkOption {
      type = types.str;
      default = "datacare";
      description = ''systemd user'';
    };
    group = mkOption {
      type = types.str;
      default = "datacare";
      description = ''group of systemd user'';
    };
    
    logLevel = mkOption {
      # TODO: make an enum of possible values
      type = types.str;
      # this is a little weird because if want to see all the correct value would be trace
      default = "datacare";
      description = ''log level of the application'';
    };
  };

  config = lib.mkIf cfg.enable {
    environment.systemPackages = [ pkgs.bahn-bingo-backend pkgs.bahn-bingo-frontend ];
    systemd.services = {
      "bahn.bingo" = {
        enable = true;

        description = "bingo field generator";
        wantedBy = [ "multi-user.target" ];

        script = ''
          exec ${pkgs.bahn-bingo-backend}/bin/bahn_bingo&
        '';

        environment = {
          "RUST_BACKTRACE" = "${cfg.rustBacktrace}";
          "RUST_LOG" = "${cfg.log_level}";
          "BAHNBINGO_HTTP_PORT" = "${toString cfg.http.port}";
          "BAHNBINGO_HTTP_HOST" = "${toString cfg.http.host}";
          "BAHNBINGO_PICTURE_FOLDER" = "${toString cfg.pictureFolder}";
          "BAHNBINGO_BINGO_TEMPLATE" = "${toString cfg.bingoTemplate}";
          "BAHNBINGO_FIELD_CONFIG" = "${toString cfg.bingoFieldConfig}";
        };

        serviceConfig = {
          Type = "forking";
          User = "datacare";
          Restart = "always";
        };
      };
    };
    services.nginx = {
    enable = true;
    virtualHosts = {
      "${cfg.domains.websiteDomain}" = {
        enableACME = true;
        forceSSL = true;
        root = "${pkgs.bahn-bingo-frontend}/bin/";
        tryFiles = "$uri /$1/index.html =404";
      };
      "${cfg.domains.filesDomain}" = {
        enableACME = true;
        forceSSL = true;
        root = cfg.pictureFolder;
      };
      "${cfg.domains.apiDomain}" = {
        enableACME = true;
        forceSSL = true;
        locations."/" = {
          proxyPass = with cfg.http; "http://${host}:${toString port}";
        };
      };
    };
  };

    # user accounts for systemd units
    users.users."${cfg.user}" = {
      name = cfg.user;
      isSystemUser = true;
      group = cfg.group;
    };
  };
}
