package com.vfms.rental;

import com.vfms.common.dto.ApiResponse;
import com.vfms.rental.dto.VendorDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping
    public ResponseEntity<ApiResponse<Vendor>> create(@Valid @RequestBody VendorDto dto) {
        Vendor vendor = vendorService.createVendor(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vendor created", vendor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Vendor>> update(
            @PathVariable Long id, @Valid @RequestBody VendorDto dto) {
        Vendor vendor = vendorService.updateVendor(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Vendor updated", vendor));
    }

    // Excludes inactive vendors by default so callers get a clean, actionable list without needing to filter on their side
    @GetMapping
    public ResponseEntity<ApiResponse<List<Vendor>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Vendors fetched", vendorService.getAllVendors()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vendor>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Vendor fetched", vendorService.getVendorById(id)));
    }

    // Separate endpoint so access to inactive vendor data can be restricted independently if needed
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Vendor>>> getAllIncludingInactive() {
        return ResponseEntity.ok(
                ApiResponse.success("All vendors fetched", vendorService.getAllVendorsIncludingInactive()));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<Vendor>> toggleStatus(@PathVariable Long id) {
        Vendor vendor = vendorService.toggleActive(id);

        // Derived from updated state so the response always reflects what actually happened
        String msg = vendor.getActive() ? "Vendor activated" : "Vendor deactivated";

        return ResponseEntity.ok(ApiResponse.success(msg, vendor));
    }
}