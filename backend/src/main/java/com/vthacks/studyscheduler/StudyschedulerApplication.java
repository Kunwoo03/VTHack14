package com.vthacks.studyscheduler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Locale;

@SpringBootApplication
public class StudyschedulerApplication {

	public static void main(String[] args) {
		// Force English everywhere (e.g. Bean Validation default messages),
		// regardless of the host machine's OS locale.
		Locale.setDefault(Locale.ENGLISH);
		SpringApplication.run(StudyschedulerApplication.class, args);
	}

}
