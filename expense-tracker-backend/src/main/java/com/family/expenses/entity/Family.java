package com.family.expenses.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "families")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL)
    private List<User> users;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL)
    private List<Account> accounts;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL)
    private List<Category> categories;
}
