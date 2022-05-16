package com.tholerus.clockmancerrest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

//@Configuration
//@EntityScan(basePackages = "com.tholerus.clockmancerrest")
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class })
public class ClockmancerRestApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClockmancerRestApplication.class, args);
	}

	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/domain").allowedOrigins("http://localhost:8080");
			}
		};
	}

}
