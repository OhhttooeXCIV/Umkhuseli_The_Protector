package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.SafeJourneyEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SafeJourneyDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertJourney(journey: SafeJourneyEntity): Long

    @Update
    suspend fun updateJourney(journey: SafeJourneyEntity)

    @Query("SELECT * FROM safe_journeys WHERE status = 'ACTIVE' LIMIT 1")
    suspend fun getActiveJourney(): SafeJourneyEntity?

    @Query("SELECT * FROM safe_journeys WHERE status = 'ACTIVE' LIMIT 1")
    fun observeActiveJourney(): Flow<SafeJourneyEntity?>

    @Query("SELECT * FROM safe_journeys ORDER BY startedAt DESC")
    fun getAllJourneys(): Flow<List<SafeJourneyEntity>>

    @Query("UPDATE safe_journeys SET status = :status, endedAt = :endedAt WHERE id = :id")
    suspend fun updateStatus(id: Long, status: String, endedAt: Long? = System.currentTimeMillis())
}
