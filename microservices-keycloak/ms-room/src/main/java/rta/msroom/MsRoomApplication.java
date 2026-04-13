package rta.msroom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MsRoomApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsRoomApplication.class, args);
	}

}
