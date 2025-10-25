package CodeCatalyst.Driver.Staff.Management.model;

public class Driver {
    private Long id;
    private String fullName;
    private String licenseNumber;
    private String phone;
    private boolean available;

    public Driver(Long id, String fullName, String licenseNumber, String phone, boolean available) {
        this.id = id;
        this.fullName = fullName;
        this.licenseNumber = licenseNumber;
        this.phone = phone;
        this.available = available;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getLicenseNumber() { return licenseNumber; }
    public String getPhone() { return phone; }
    public boolean isAvailable() { return available; }

    public void setId(Long id) { this.id = id; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAvailable(boolean available) { this.available = available; }
}
