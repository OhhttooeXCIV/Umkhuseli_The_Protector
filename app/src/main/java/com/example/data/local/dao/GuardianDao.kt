package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.GuardianEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface GuardianDao {
    @Query("SELECT * FROM guardians ORDER BY isPrimary DESC, id ASC")
    fun getAllGuardians(): Flow<List<GuardianEntity>>

    @Query("SELECT * FROM guardians WHERE notifyViaSms = 1")
    suspend fun getActiveGuardians(): List<GuardianEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertGuardian(guardian: GuardianEntity): Long

    @Update
    suspend fun updateGuardian(guardian: GuardianEntity)

    @Delete
    suspend fun deleteGuardian(guardian: GuardianEntity)

    @Query("SELECT COUNT(*) FROM guardians")
    suspend fun getCount(): Int
}
