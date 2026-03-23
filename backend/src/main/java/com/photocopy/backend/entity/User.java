package com.photocopy.backend.entity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Objects;

import com.photocopy.backend.constant.UserRole;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING) 
    @Column(nullable = false)
    private UserRole role;
    @Column(name = "full_name")
    private String fullName;
    @Column(name = "phone_number")
    private String phoneNumber;
    @Column(name = "address")
    private String address;
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
    @Column(name="user_point")
    @Builder.Default
    private Long userPoint=0L;

    public void updateProfile(String phoneNumber, String address){
        this.phoneNumber= phoneNumber;
        this.address= address;
    }

    public void changeStatus(){
        this.isActive = !this.isActive;
    }

    public void changePassword(String encodedPassword){
        this.password = encodedPassword;
    }

    public void updateUserPoint(Long amount){
        this.userPoint = amount;
    }
    public void updateAddress(String address){
        this.address = address;
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", fullName='" + fullName + '\'' +
                ", userPoint=" + userPoint + '\''+
                '}';
    }
}
