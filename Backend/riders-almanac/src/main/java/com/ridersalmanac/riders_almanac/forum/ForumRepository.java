package com.ridersalmanac.riders_almanac.forum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ForumRepository extends JpaRepository<Post, Long> {

    @Query("""
            select p from Post p
            where p.isDeleted = false
              and p.status = com.ridersalmanac.riders_almanac.forum.Post.Status.PUBLISHED
            order by coalesce(p.lastActivityAt, p.createdAt) desc
            """)
    Page<Post> findFeed(Pageable pageable);

    Optional<Post> findByIdAndIsDeletedFalse(Long id);

    @Query("""
            select distinct p from Post p
            join p.tagEntities t
            where p.isDeleted = false
              and p.status = com.ridersalmanac.riders_almanac.forum.Post.Status.PUBLISHED
              and t.slug in :slugs
            order by coalesce(p.lastActivityAt, p.createdAt) desc
            """)
    Page<Post> findFeedByAnyTag(@Param("slugs") Collection<String> slugs,
                                Pageable pageable);

    @Query("""
            select p from Post p
            join p.tagEntities t
            where p.isDeleted = false
              and p.status = com.ridersalmanac.riders_almanac.forum.Post.Status.PUBLISHED
              and t.slug in :slugs
            group by p.id
            having count(distinct t.slug) = :countSlugs
            order by coalesce(p.lastActivityAt, p.createdAt) desc
            """)
    Page<Post> findFeedByAllTags(@Param("slugs") Collection<String> slugs,
                                 @Param("countSlugs") long countSlugs,
                                 Pageable pageable);

    @Query("""
            select p from Post p
            where p.isDeleted = false
              and p.status <> com.ridersalmanac.riders_almanac.forum.Post.Status.DELETED
            order by coalesce(p.lastActivityAt, p.createdAt) desc
            """)
    Page<Post> findFeedIncludingHidden(Pageable pageable);

    @Query("""
            select distinct p from Post p
            join p.tagEntities t
            where p.isDeleted = false
              and p.status <> com.ridersalmanac.riders_almanac.forum.Post.Status.DELETED
              and t.slug in :slugs
            order by coalesce(p.lastActivityAt, p.createdAt) desc
            """)
    Page<Post> findFeedByAnyTagIncludingHidden(@Param("slugs") Collection<String> slugs,
                                               Pageable pageable);

    @Query("""
            select p from Post p
            join p.tagEntities t
            where p.isDeleted = false
              and p.status <> com.ridersalmanac.riders_almanac.forum.Post.Status.DELETED
              and t.slug in :slugs
            group by p.id
            having count(distinct t.slug) = :countSlugs
            order by coalesce(p.lastActivityAt, p.createdAt) desc
            """)
    Page<Post> findFeedByAllTagsIncludingHidden(@Param("slugs") Collection<String> slugs,
                                                @Param("countSlugs") long countSlugs,
                                                Pageable pageable);

    @Query("""
              select p
              from Post p
              where p.status = com.ridersalmanac.riders_almanac.forum.Post.Status.PUBLISHED
                and p.isDeleted = false
              order by
                (select count(c)
                   from com.ridersalmanac.riders_almanac.forum.Comment c
                  where c.post = p
                    and c.status = com.ridersalmanac.riders_almanac.forum.Comment.Status.PUBLISHED
                    and c.createdAt >= :since
                ) desc,
                coalesce(p.lastActivityAt, p.createdAt) desc,
                p.id desc
            """)
    Page<Post> findTrending(@Param("since") Instant since, Pageable pageable);


    @Query("""
            select t from Post p
            join p.tagEntities t
            where p.isDeleted = false
              and p.status = com.ridersalmanac.riders_almanac.forum.Post.Status.PUBLISHED
              and t.enabled = true
            group by t
            order by count(p) desc, t.label asc
            """)
    List<Tag> findTopTags(Pageable pageable);

}