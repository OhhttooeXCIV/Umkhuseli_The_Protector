package com.example.service

import android.content.Context
import android.content.pm.PackageManager
import android.provider.ContactsContract
import androidx.core.content.ContextCompat
import com.example.data.local.dao.RegisteredContactDao
import com.example.data.local.entity.RegisteredContactEntity
import java.security.MessageDigest

data class DiscoveredPhoneContact(
    val name: String,
    val rawPhone: String,
    val normalizedE164: String,
    val phoneHash: String
)

class ContactDiscoveryHelper(
    private val context: Context? = null,
    private val registeredContactDao: RegisteredContactDao? = null
) {

    companion object {
        const val HASH_SALT = "Umkhuseli_Safe_Contact_2026"

        fun normalizeToE164(rawPhone: String): String {
            val digits = rawPhone.filter { it.isDigit() || it == '+' }
            return when {
                digits.startsWith("+27") -> digits
                digits.startsWith("27") && digits.length >= 11 -> "+$digits"
                digits.startsWith("0") && digits.length == 10 -> "+27" + digits.substring(1)
                digits.startsWith("+") -> digits
                else -> "+27$digits"
            }
        }

        fun hashPhoneNumber(e164Phone: String, salt: String = HASH_SALT): String {
            val input = "$salt:$e164Phone"
            val md = MessageDigest.getInstance("SHA-256")
            val digest = md.digest(input.toByteArray(Charsets.UTF_8))
            return digest.joinToString("") { "%02x".format(it) }
        }
    }

    fun hasContactsPermission(): Boolean {
        if (context == null) return false
        return ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.READ_CONTACTS
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun readLocalPhoneContacts(): List<DiscoveredPhoneContact> {
        if (context == null || !hasContactsPermission()) return emptyList()

        val contactList = mutableListOf<DiscoveredPhoneContact>()
        val contentResolver = context.contentResolver
        val cursor = contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            arrayOf(
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Phone.NUMBER
            ),
            null,
            null,
            "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME} ASC"
        )

        cursor?.use {
            val nameIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
            val numberIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)

            while (it.moveToNext()) {
                val name = if (nameIndex >= 0) it.getString(nameIndex) ?: "Contact" else "Contact"
                val rawPhone = if (numberIndex >= 0) it.getString(numberIndex) ?: "" else ""

                if (rawPhone.isNotBlank()) {
                    val normalized = normalizeToE164(rawPhone)
                    val hash = hashPhoneNumber(normalized)
                    contactList.add(
                        DiscoveredPhoneContact(
                            name = name,
                            rawPhone = rawPhone,
                            normalizedE164 = normalized,
                            phoneHash = hash
                        )
                    )
                }
            }
        }
        return contactList
    }

    suspend fun syncAndCacheDiscoveredContacts(
        discoveredContacts: List<DiscoveredPhoneContact>,
        registeredAppHashes: Set<String>
    ): Int {
        if (registeredContactDao == null) return 0

        val entities = discoveredContacts.map { contact ->
            RegisteredContactEntity(
                phoneHash = contact.phoneHash,
                contactName = contact.name,
                rawPhoneNumber = contact.rawPhone,
                isAppUser = registeredAppHashes.contains(contact.phoneHash),
                lastDiscoveredAt = System.currentTimeMillis()
            )
        }

        registeredContactDao.insertAll(entities)
        return entities.count { it.isAppUser }
    }
}
