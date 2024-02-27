export type NetworkInterface = {
  id: number;
  IPAddress: {
    ipVersion: string;
    addressingType: string;
    ipAddress: string;
    subnetMask: string;
    ipv6Address: string;
    bitMask: number;
    DefaultGateway: {
      ipAddress: string;
      ipv6Address: string;
    };
    PrimaryDNS: {
      ipAddress: string;
    };
    SecondaryDNS: {
      ipAddress: string;
    };
    Ipv6Mode: {
      ipV6AddressingType: string;
      ipv6AddressList: {
        v6Address: {
          id: number;
          type: string;
          address: string;
          bitMask: number;
        };
      };
    };
  };
  Discovery: {
    UPnP: {
      enabled: boolean;
    };
    Zeroconf: {
      enabled: boolean;
    };
  };
  Link: {
    MACAddress: string;
    autoNegotiation: boolean;
    speed: number;
    duplex: string;
    MTU: number;
  };
};
