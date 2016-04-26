package com.user.register.micro.endpoint;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserManagementRepository extends CrudRepository<User, Integer> {

}
