package com.ridersalmanac.riders_almanac.forum;

import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findBySlugIgnoreCase(String slug);
    List<Tag> findByEnabledTrueOrderByLabelAsc();
    List<Tag> findByEnabledFalseOrderByLabelAsc();


    @Query("select t from Tag t where lower(t.label) like lower(concat('%', :q, '%')) or lower(t.slug) like lower(concat('%', :q, '%')) order by t.label asc")
    List<Tag> search(String q);
}