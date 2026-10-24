package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.local.entity.RegisteredContactEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RegisteredContactDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(contacts: List<RegisteredContactEntity>)

    @Query("SELECT * FROM registered_contacts WHERE isAppUser = 1 ORDER BY contactName ASC")
    fun getRegisteredAppFriends(): Flow<List<RegisteredContactEntity>>

    @Query("SELECT * FROM registered_contacts ORDER BY contactName ASC")
    fun getAllContacts(): Flow<List<RegisteredContactEntity>>

    @Query("DELETE FROM registered_contacts")
    suspend fun clearAll()
}
