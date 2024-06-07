{ pkgs, config, lib, ... }:
let
  cfg = config.bahn-bingo;
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
        description = ''host of bahnbingo'';
      };
      port = mkOption {
        type = types.port;
        default = 5070;
        description = ''port of bahnbingo'';
      };
    };
    pictureFolder = mkOption {
      type = types.str;
      default = "/var/lib/bahn-bingo/pictures/";
      description = ''where the service should drop its images'';
    };
    bingoTemplate = mkOption {
      type = types.str;
      default = "${../share_template.svg}";
      description = ''where the bingo field template lives'';
    };
    bingoFieldConfig = mkOption {
      type = types.str;
      default = "${../bingo-values.json}";
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
      default = "bahnbingo";
      description = ''systemd user'';
    };
    group = mkOption {
      type = types.str;
      default = "bahnbingo";
      description = ''group of systemd user'';
    };
    
    logLevel = mkOption {
      type = types.str;
      default = "info";
      description = ''log level of the application'';
    };
  };

  config = lib.mkIf cfg.enable {
    environment.systemPackages = [ pkgs.bahn-bingo-frontend ];
    systemd.services = {
      "bahn-bingo" = {
        enable = true;

        description = "bingo field generator";
        wantedBy = [ "multi-user.target" ];
        after = [ "bahn-bingo-setup.service" ];

        script = ''
          exec ${pkgs.python311.withPackages(ps: with ps; [ pyvips flask ])}/bin/python3.11 ${../bahnbingo/__init__.py}&
        '';

        environment = {
          "RUST_BACKTRACE" = "${cfg.rustBacktrace}";
          "RUST_LOG" = "${cfg.logLevel}";
          "BAHNBINGO_HTTP_PORT" = "${toString cfg.http.port}";
          "BAHNBINGO_HTTP_HOST" = "${toString cfg.http.host}";
          "BAHNBINGO_PICTURE_FOLDER" = "${toString cfg.pictureFolder}";
          "BAHNBINGO_BINGO_TEMPLATE" = "${toString cfg.bingoTemplate}";
          "BAHNBINGO_FIELD_CONFIG" = "${toString cfg.bingoFieldConfig}";
        };

        serviceConfig = {
          Type = "forking";
          User = cfg.user;
          Restart = "always";
        };
      };
      "bahn-bingo-setup" = {
        description = "create folders for bahn.bingo";
        wantedBy = [ "multi-user.target" ];
        serviceConfig.Type = "oneshot";

        path = [ pkgs.sudo ];

        script = ''
          mkdir -p ${cfg.pictureFolder}
          chown ${cfg.user}:nginx ${cfg.pictureFolder}
          chmod 774 ${cfg.pictureFolder}
        '';
      };
    };
    services.nginx = {
    enable = true;
    virtualHosts = {
      "${cfg.domains.websiteDomain}" = {
        enableACME = true;
        forceSSL = true;
        locations."/" = {
          tryFiles = "$uri /$1/index.html =404";
          root = "${pkgs.bahn-bingo-frontend}/bin/";
        };
        extraConfig = ''
          add_header 'Access-Control-Allow-Origin' '*';
          add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT';
          add_header 'Access-Control-Allow-Credentials' 'true';
          add_header 'Access-Control-Allow-Headers' '*';
        '';
      };
      "${cfg.domains.filesDomain}" = {
        enableACME = true;
        forceSSL = true;
        locations."/" = {
          root = cfg.pictureFolder;
        };
        extraConfig = ''
          add_header 'Access-Control-Allow-Origin' '*';
          add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT';
          add_header 'Access-Control-Allow-Credentials' 'true';
          add_header 'Access-Control-Allow-Headers' '*';
        '';
      };
      "${cfg.domains.apiDomain}" = {
        enableACME = true;
        forceSSL = true;
        locations."/" = {
          proxyPass = with cfg.http; "http://${host}:${toString port}";
        };
        extraConfig = ''
          add_header 'Access-Control-Allow-Origin' '*';
          add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT';
          add_header 'Access-Control-Allow-Credentials' 'true';
          add_header 'Access-Control-Allow-Headers' '*';
        '';
      };
    };
  };

    # user accounts for systemd units
    users.users."${cfg.user}" = {
      name = cfg.user;
      isSystemUser = true;
      group = cfg.group;
    };
    users.groups.bahnbingo = {};
  };
}
