package com.vfms.auth.service;

import com.vfms.auth.model.User;
import com.vfms.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Integer id, User userDetails) {
        User user = getUserById(id);
        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        // Do not update password here
        return repository.save(user);
    }

    public void deleteUser(Integer id) {
        repository.deleteById(id);
    }
}
