/**
 * samples.js — Embedded sample bill texts for offline/local use
 */

const Samples = (() => {

  const SAMPLE_BILL_V1 = `H.R. 1234 \u2014 Digital Privacy Protection Act of 2026

IN THE HOUSE OF REPRESENTATIVES

Mr. Smith introduced the following bill:

A BILL

To establish comprehensive digital privacy protections for citizens, to regulate the collection and use of personal data by technology companies, and for other purposes.

Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,

SECTION 1. SHORT TITLE.
This Act may be cited as the "Digital Privacy Protection Act of 2026."

SECTION 2. DEFINITIONS.
In this Act:
(1) COVERED ENTITY.\u2014The term "covered entity" means any person or organization that collects, processes, stores, or transfers personal data of more than 50,000 individuals in any 12-month period.
(2) PERSONAL DATA.\u2014The term "personal data" means any information that identifies, relates to, describes, or is reasonably capable of being associated with a particular individual.
(3) SENSITIVE DATA.\u2014The term "sensitive data" means personal data that includes biometric information, geolocation data, health records, financial information, or data pertaining to individuals under the age of 16.
(4) DATA BROKER.\u2014The term "data broker" means an entity whose primary business involves the sale or licensing of personal data to third parties with whom the individual has no direct relationship.
(5) COMMISSION.\u2014The term "Commission" refers to the Federal Trade Commission.

SECTION 3. DATA COLLECTION REQUIREMENTS.
(a) CONSENT REQUIREMENT.\u2014No covered entity may collect personal data from an individual without first obtaining affirmative express consent from such individual.
(b) PURPOSE LIMITATION.\u2014A covered entity shall collect only such personal data as is reasonably necessary for the disclosed purpose of collection.
(c) NOTICE.\u2014Prior to collection, a covered entity shall provide clear and conspicuous notice to the individual describing the categories of data to be collected, the purposes of collection, and the duration of retention.
(d) REFERENCE.\u2014The consent mechanisms described in this section shall comply with the standards established by the Commission under Section 7 of this Act.

SECTION 4. DATA SECURITY.
(a) SECURITY MEASURES.\u2014Each covered entity shall implement and maintain reasonable administrative, technical, and physical safeguards to protect personal data against unauthorized access, destruction, use, modification, or disclosure.
(b) BREACH NOTIFICATION.\u2014In the event of a data breach affecting the personal data of more than 500 individuals, the covered entity shall notify affected individuals and the Commission within 72 hours of discovery.
(c) ANNUAL AUDITS.\u2014Covered entities processing the sensitive data (as defined in Section 2(3)) of more than 1,000,000 individuals shall conduct annual third-party security audits.

SECTION 5. INDIVIDUAL RIGHTS.
(a) RIGHT TO ACCESS.\u2014An individual shall have the right to request and obtain from a covered entity confirmation of whether personal data concerning the individual is being processed, and access to such data.
(b) RIGHT TO DELETION.\u2014An individual shall have the right to request that a covered entity delete all personal data concerning the individual, subject to exceptions enumerated in subsection (d).
(c) RIGHT TO PORTABILITY.\u2014An individual shall have the right to receive personal data in a structured, commonly used, and machine-readable format.
(d) EXCEPTIONS.\u2014The rights described in this section shall not apply where compliance would violate Federal or State law, interfere with law enforcement proceedings, or where the data is required for the completion of a transaction requested by the individual.

SECTION 6. RESTRICTIONS ON DATA BROKERS.
(a) REGISTRATION.\u2014Each data broker shall register with the Commission on an annual basis and provide a description of categories of data collected and the purposes for which data is sold or licensed.
(b) OPT-OUT MECHANISM.\u2014Data brokers shall provide a clear, accessible mechanism through which individuals may opt out of having their personal data sold or licensed.
(c) PROHIBITION ON SENSITIVE DATA.\u2014No data broker may sell or license sensitive data as defined in Section 2(3) without the explicit consent of the individual.

SECTION 7. ENFORCEMENT.
(a) FTC ENFORCEMENT.\u2014The Commission shall enforce this Act under the Federal Trade Commission Act (15 U.S.C. 41 et seq.).
(b) CIVIL PENALTIES.\u2014Any covered entity that violates this Act shall be liable for a civil penalty of not more than $50,000 per violation per day.
(c) PRIVATE RIGHT OF ACTION.\u2014Any individual whose rights under this Act are violated may bring a civil action in any court of competent jurisdiction and may recover actual damages, or statutory damages of not less than $100 and not more than $1,000 per violation.
(d) STATE ATTORNEYS GENERAL.\u2014The attorney general of any State may bring a civil action on behalf of residents of that State for violations of this Act occurring within the State.

SECTION 8. SEVERABILITY.
If any provision of this Act, or the application thereof, is held invalid, the remainder of this Act and the application of such provision to other persons or circumstances shall not be affected thereby.

SECTION 9. EFFECTIVE DATE.
This Act shall take effect 180 days after the date of enactment.`;

  const SAMPLE_BILL_V2 = `H.R. 1234 \u2014 Digital Privacy Protection Act of 2026

IN THE HOUSE OF REPRESENTATIVES

Mr. Smith introduced the following bill:

A BILL

To establish comprehensive digital privacy protections for citizens, to regulate the collection and use of personal data by technology companies, and for other purposes.

Be it enacted by the Senate and House of Representatives of the United States of America in Congress assembled,

SECTION 1. SHORT TITLE.
This Act may be cited as the "Digital Privacy Protection Act of 2026."

SECTION 2. DEFINITIONS.
In this Act:
(1) COVERED ENTITY.\u2014The term "covered entity" means any person or organization that collects, processes, stores, or transfers personal data of more than 50,000 individuals in any 12-month period.
(2) PERSONAL DATA.\u2014The term "personal data" means any information that identifies, relates to, describes, or is reasonably capable of being associated with a particular individual.
(3) SENSITIVE DATA.\u2014The term "sensitive data" means personal data that includes biometric information, geolocation data, health records, financial information, or data pertaining to individuals under the age of 16.
(4) DATA BROKER.\u2014The term "data broker" means an entity whose primary business involves the sale or licensing of personal data to third parties with whom the individual has no direct relationship.
(5) COMMISSION.\u2014The term "Commission" refers to the Federal Trade Commission.

SECTION 3. DATA COLLECTION REQUIREMENTS.
(a) CONSENT REQUIREMENT.\u2014No covered entity may collect personal data from an individual without first obtaining opt-in consent through a verified mechanism from such individual.
(b) PURPOSE LIMITATION.\u2014A covered entity shall collect only such personal data as is reasonably necessary for the disclosed purpose of collection.
(c) NOTICE.\u2014Prior to collection, a covered entity shall provide clear and conspicuous notice to the individual describing the categories of data to be collected, the purposes of collection, and the duration of retention.
(d) REFERENCE.\u2014The consent mechanisms described in this section shall comply with the standards established by the Commission under Section 7 of this Act.

SECTION 4. DATA SECURITY.
(a) SECURITY MEASURES.\u2014Each covered entity shall implement and maintain reasonable administrative, technical, and physical safeguards to protect personal data against unauthorized access, destruction, use, modification, or disclosure.
(b) BREACH NOTIFICATION.\u2014In the event of a data breach affecting the personal data of more than 250 individuals, the covered entity shall notify affected individuals and the Commission within 48 hours of discovery.
(c) ANNUAL AUDITS.\u2014Covered entities processing the sensitive data (as defined in Section 2(3)) of more than 1,000,000 individuals shall conduct annual third-party security audits.
(d) ENCRYPTION REQUIREMENT.\u2014All sensitive data stored by a covered entity shall be encrypted using industry-standard encryption algorithms.

SECTION 5. INDIVIDUAL RIGHTS.
(a) RIGHT TO ACCESS.\u2014An individual shall have the right to request and obtain from a covered entity confirmation of whether personal data concerning the individual is being processed, and access to such data.
(b) RIGHT TO DELETION.\u2014An individual shall have the right to request that a covered entity delete all personal data concerning the individual, subject to exceptions enumerated in subsection (d).
(c) RIGHT TO PORTABILITY.\u2014An individual shall have the right to receive personal data in a structured, commonly used, and machine-readable format.
(d) EXCEPTIONS.\u2014The rights described in this section shall not apply where compliance would violate Federal or State law, interfere with law enforcement proceedings, or where the data is required for the completion of a transaction requested by the individual.

SECTION 6. RESTRICTIONS ON DATA BROKERS.
(a) REGISTRATION.\u2014Each data broker shall register with the Commission on an annual basis and provide a description of categories of data collected and the purposes for which data is sold or licensed.
(b) OPT-OUT MECHANISM.\u2014Data brokers shall provide a clear, accessible mechanism through which individuals may opt out of having their personal data sold or licensed.

SECTION 7. ENFORCEMENT.
(a) FTC ENFORCEMENT.\u2014The Commission shall enforce this Act under the Federal Trade Commission Act (15 U.S.C. 41 et seq.).
(b) CIVIL PENALTIES.\u2014Any covered entity that violates this Act shall be liable for a civil penalty of not more than $75,000 per violation per day.
(c) PRIVATE RIGHT OF ACTION.\u2014Any individual whose rights under this Act are violated may bring a civil action in any court of competent jurisdiction and may recover actual damages, or statutory damages of not less than $100 and not more than $5,000 per violation.
(d) STATE ATTORNEYS GENERAL.\u2014The attorney general of any State may bring a civil action on behalf of residents of that State for violations of this Act occurring within the State.

SECTION 8. SEVERABILITY.
If any provision of this Act, or the application thereof, is held invalid, the remainder of this Act and the application of such provision to other persons or circumstances shall not be affected thereby.

SECTION 9. EFFECTIVE DATE.
This Act shall take effect 180 days after the date of enactment.`;

  return { SAMPLE_BILL_V1, SAMPLE_BILL_V2 };
})();